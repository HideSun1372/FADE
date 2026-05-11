package com.hidesun1372.fade.service;

import org.springframework.stereotype.Service;

@Service
public class MovementService {
    public int getNextRoom(int roomID, String direction, boolean hasKey) {
        return switch (roomID) {
            case 0 -> {
                if (direction.equals("NORTH")) yield 1;
                else yield 0;
            }
            case 1 -> {
                if (direction.equals("NORTH")) yield 2;
                else if (direction.equals("SOUTH")) yield 0;
                else yield 1;
            }
            case 2 -> {
                if (direction.equals("NORTH")) yield 3;
                else if (direction.equals("SOUTH")) yield 1;
                else yield 2;
            }
            case 3 -> {
                if (direction.equals("NORTH")) yield 4;
                else if  (direction.equals("SOUTH")) yield 2;
                else yield 3;
            }
            case 4 -> {
                if (direction.equals("NORTH")) yield 5;
                else if (direction.equals("SOUTH")) yield 3;
                else yield 4;
            }
            case 5 -> {
                if (direction.equals("SOUTH")) yield 4;
                else yield 5;
            }
            default -> roomID;
        };
    }
}

