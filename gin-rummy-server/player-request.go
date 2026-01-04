package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
)

// PlayerRequest initial state of player turn
type PlayerRequest struct {
	// Cards that are in discarded pile
	History []Card `json:"history"`
	// Current state of player melds
	Melds []Meld `json:"melds"`
	// New card to be considered
	NewCard Card `json:"newCard"`
}

// PlayerResponse with decission
type PlayerResponse struct {
	// Current state of player melds
	Melds []Meld `json:"melds"`
	// Card to discard
	DiscardedCard Card `json:"discardedCard"`
	// New card that was considered
	NewCard Card `json:"newCard"`
}

func toJSON[T any](obj *T) string {
	data, err := json.Marshal(obj)
	if err != nil {
		log.Printf("failed to serialzie response: %s", err.Error())
		return ""
	}

	return string(data)
}

func fromJSON[T any](data []byte) (*T, error) {
	var obj T
	err := json.Unmarshal(data, &obj)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return nil, err
	}

	return &obj, nil
}

func fromIOReader(reader io.ReadCloser) (*PlayerRequest, error) {
	body, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	request, err := fromJSON[PlayerRequest](body)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return nil, err
	}

	return request, nil
}

// Meld representation
type Meld struct {
	ID    int    `json:"id"`
	Cards []Card `json:"cards"`
}

// Card representation
type Card struct {
	// "♠","♥","♦","♣"
	Suite string `json:"suite"`
	// 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
	Face string `json:"face"`
}
