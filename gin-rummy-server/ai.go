package main

import (
	"bytes"
	"context"
	"log"
	"strings"
	"text/template"

	"google.golang.org/genai"
)

func askAI(ctx context.Context, playerRequest *PlayerRequest) (*PlayerResponse, error) {
	prompt, err := getPrompt(playerRequest)
	if err != nil {
		return nil, err
	}

	response, err := sendRequest(ctx, prompt)
	if err != nil {
		return nil, err
	}
	log.Println("ai response: '" + response + "'")

	playerReposne, err := fromJSON[PlayerResponse]([]byte(response))
	return playerReposne, nil
}

func sendRequest(ctx context.Context, prompt string) (string, error) {
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		HTTPOptions: genai.HTTPOptions{APIVersion: "v1"},
	})
	if err != nil {
		return "", err
	}

	resp, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-flash-lite",
		genai.Text(prompt),
		nil,
	)
	if err != nil {
		return "", err
	}

	text := strings.TrimSuffix(strings.TrimPrefix(resp.Text(), "```json"), "```")
	return text, nil
}

func getPrompt(request *PlayerRequest) (string, error) {
	var hand []Card

	for _, meld := range request.Melds {
		for _, card := range meld.Cards {
			hand = append(hand, card)
		}
	}

	input := struct {
		Hand    []Card `json:"hand"`
		NewCard Card   `json:"newCard"`
	}{
		Hand:    hand,
		NewCard: request.NewCard,
	}

	data := struct {
		Data string
	}{
		Data: toJSON(&input),
	}

	log.Println("ai request: '" + data.Data + "'")

	// var tmplFile = "prompt.tmpl"
	var tmplFile = "/usr/etc/gin-rummy-prompt.tmpl"
	tmpl, err := template.ParseFiles(tmplFile)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}
