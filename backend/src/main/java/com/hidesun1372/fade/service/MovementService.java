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
                if (direction.equals("SOUTH")) yield 2;
                else if (direction.equals("WEST")) yield 0;
                else if (direction.equals("EAST") && (hasKey)) yield 3;
                else yield 1;
            }
            default -> roomID;
        };
    }
}

