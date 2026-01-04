package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"google.golang.org/genai"
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

	// response, err := askAI(r.Context())
	// if err != nil {
	// 	log.Printf("failed to get response from AI: %s", err.Error())
	// 	w.WriteHeader(http.StatusBadGateway)
	// 	return
	// }

	playerReposne := PlayerResponse{
		Melds:         playerRequest.Melds,
		DiscardedCard: playerRequest.NewCard,
		NewCard:       playerRequest.NewCard,
	}
	fmt.Fprintf(w, "%s", toJSON(&playerReposne))
}

func askAI(ctx context.Context) (string, error) {
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		HTTPOptions: genai.HTTPOptions{APIVersion: "v1"},
	})
	if err != nil {
		return "", err
	}

	resp, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-flash",
		genai.Text("How does AI works"),
		nil,
	)
	if err != nil {
		return "", err
	}

	log.Print(resp.Text())
	return resp.Text(), nil
}
