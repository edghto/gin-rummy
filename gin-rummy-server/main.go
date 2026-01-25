package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	log.Print("starting server...")

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "ready for action!")
	})

	http.HandleFunc("/api/player/turn", func(w http.ResponseWriter, r *http.Request) {
		handlePlayerTurn(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("defaulting to port %s", port)
	}

	log.Printf("listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func handlePlayerTurn(w http.ResponseWriter, r *http.Request) {
	playerRequest, err := fromIOReader(r.Body)
	if err != nil {
		log.Printf("failed to parse request: %s", err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	playerResponse, err := askAI(r.Context(), playerRequest)
	if err != nil {
		log.Printf("failed to get response from AI: %s", err.Error())
		w.WriteHeader(http.StatusBadGateway)
		return
	}
	fmt.Fprintf(w, "%s", toJSON(&playerResponse))
}
