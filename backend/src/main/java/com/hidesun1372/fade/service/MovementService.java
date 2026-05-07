package com.hidesun1372.fade.service;

import org.springframework.*;

public class MovementService {
    private int getNextRoom(int roomID, String Direction, boolean hasKey) {
        return switch (roomID) {
            case 0 -> {
                if (Direction.equals("NORTH")) yield 1;
                else yield 0;
            }
            case 1 -> {
                if (Direction.equals("SOUTH")) yield 2;
                else if (Direction.equals("WEST")) yield 0;
                else if (Direction.equals("EAST") && (hasKey)) yield 3;
                else yield 1;
            }
            default -> roomID;
        };
    }
}

