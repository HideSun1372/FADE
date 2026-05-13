package com.hidesun1372.fade.service;

import org.springframework.stereotype.Service;

@Service
public class MovementService {
    @SuppressWarnings("ConvertToStringSwitch")
    public int getNextRoom(int roomID, String direction, boolean requirementsMet) {
        return switch (roomID) {
            case 0 -> {
                if (direction.equals("NORTH") && requirementsMet) yield 1;
                else if (direction.equals("EAST")) yield 11;
                else yield 0;
            }
            case 1 -> {
                if (direction.equals("EAST")) yield 2;
                else if (direction.equals("SOUTH")) yield 0;
                else yield 1;
            }
            case 2 -> {
                if (direction.equals("SOUTH")) yield 3;
                else if (direction.equals("WEST")) yield 1;
                else yield 2;
            }
            case 3 -> {
                if (direction.equals("WEST")) yield 4;
                else if  (direction.equals("NORTH")) yield 2;
                else yield 3;
            }
            case 4 -> {
                if (direction.equals("NORTH")) yield 5;
                else if (direction.equals("EAST")) yield 3;
                else yield 4;
            }
            case 5 -> {
                if (direction.equals("WEST")) yield 6;
                else if (direction.equals("SOUTH")) yield 4;
                else yield 5;
            }
            case 11 -> {
                if (direction.equals("WEST")) yield 0;
                else yield 11;
            }
            default -> roomID;
        };
    }
}

