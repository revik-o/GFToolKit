package api

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Allow all origins for dev simplicity
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Notification represents a message sent over WS
type Notification struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Message   string `json:"message"`
	Type      string `json:"type"` // e.g., 'info', 'success', 'warning'
	Timestamp string `json:"timestamp"`
}

// Client represents a connected user
type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

// Hub maintains the set of active clients and broadcasts messages to them.
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex // For testing endpoints to safely broadcast
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// BroadcastNotification allows other API handlers to push notifications
func (h *Hub) BroadcastNotification(title, message, notifType string) {
	notif := Notification{
		ID:        uuid.New().String(),
		Title:     title,
		Message:   message,
		Type:      notifType,
		Timestamp: time.Now().Format(time.RFC3339),
	}
	data, err := json.Marshal(notif)
	if err != nil {
		log.Printf("Error marshaling notification: %v", err)
		return
	}
	h.broadcast <- data
}

// Read pumps messages from the websocket connection to the hub.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	for {
		// Just drain the read loop to keep the connection alive
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
	}
}

// Write pumps messages from the hub to the websocket connection.
func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()
	for message := range c.send {
		w, err := c.conn.NextWriter(websocket.TextMessage)
		if err != nil {
			return
		}
		w.Write(message)

		// Add queued chat messages to the current websocket message.
		n := len(c.send)
		for i := 0; i < n; i++ {
			w.Write([]byte{'\n'})
			w.Write(<-c.send)
		}

		if err := w.Close(); err != nil {
			return
		}
	}
	// The hub closed the channel.
	c.conn.WriteMessage(websocket.CloseMessage, []byte{})
}

// HandleWS handles WebSocket requests from the peer.
func (s *Server) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{hub: s.Hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()

	// Send an initial welcome notification
	welcome := Notification{
		ID:        uuid.New().String(),
		Title:     "Connected",
		Message:   "You are now connected to realtime notifications.",
		Type:      "success",
		Timestamp: time.Now().Format(time.RFC3339),
	}
	data, _ := json.Marshal(welcome)
	client.send <- data
}

// HandleTestNotification handles POST requests to broadcast a test notification
func (s *Server) HandleTestNotification(w http.ResponseWriter, r *http.Request) {
	// In a real app we might protect this with AdminMiddleware
	var req struct {
		Title   string `json:"title"`
		Message string `json:"message"`
		Type    string `json:"type"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if req.Type == "" {
		req.Type = "info"
	}

	s.Hub.BroadcastNotification(req.Title, req.Message, req.Type)
	RespondWithJSON(w, http.StatusOK, map[string]string{"status": "broadcasted"})
}
