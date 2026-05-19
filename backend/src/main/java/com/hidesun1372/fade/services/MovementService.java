package com.hidesun1372.fade.services;

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
            } case 1 -> {
                if (direction.equals("EAST") && requirementsMet) yield 2;
                else if (direction.equals("SOUTH")) yield 0;
                else if (direction.equals("NORTH")) yield 21;
                else yield 1;
            } case 2 -> {
                if (direction.equals("SOUTH") && requirementsMet) yield 3;
                else if (direction.equals("WEST")) yield 1;
                else if (direction.equals("NORTH")) yield 31;
                else yield 2;
            } case 3 -> {
                if (direction.equals("WEST") && requirementsMet) yield 4;
                else if  (direction.equals("NORTH")) yield 2;
                else if (direction.equals("SOUTH")) yield 41;
                else yield 3;
            } case 4 -> {
                if (direction.equals("NORTH")) yield 5;
                else if (direction.equals("EAST")) yield 3;
                else yield 4;
            } case 5 -> {
                if (direction.equals("WEST") && requirementsMet) yield 71;
                else if (direction.equals("SOUTH")) yield 4;
                else if (direction.equals("EAST")) yield 61;
                else yield 5;
            } case 6 -> {
                if (direction.equals("SOUTH")) yield 75;
                else if (direction.equals("WEST")) yield 7;
                else yield 6;
            } case 7 -> {
                if (direction.equals("EAST")) yield 6;
                else yield 7;
            } case 11 -> {
                if (direction.equals("WEST")) yield 0;
                else yield 11;
            } case 21 -> {
                if (direction.equals("SOUTH")) yield 1;
                else if (direction.equals("WEST")) yield 22;
                else yield 21;
            } case 22 -> {
                if (direction.equals("EAST")) yield 21;
                else yield 22;
            } case 31 -> {
                switch (direction) {
                    case "SOUTH" -> { yield 2; }
                    case "EAST" -> { yield 32; }
                    case "WEST" -> { yield 33; }
                    default -> { yield 31; }
                }
            } case 32 -> {
                if (direction.equals("WEST")) yield 31;
                else yield 32;
            } case 33 -> {
                if (direction.equals("EAST")) yield 31;
                else yield 33;
            } case 41 -> {
                if (direction.equals("NORTH")) yield 3;
                else yield 41;
            } case 61 -> {
                if (direction.equals("WEST")) yield 5;
                else if (direction.equals("SOUTH")) yield 62;
                else yield 61;
            } case 62 -> {
                if (direction.equals("NORTH") && requirementsMet) yield 61;
                else if (direction.equals("EAST")) yield 63;
                else yield 62;
            } case 63 -> {
                if (direction.equals("WEST")) yield 62;
                else yield 63;
            } case 71 -> {
                if (direction.equals("EAST")) yield 5;
                else if (direction.equals("NORTH")) yield 72;
                else yield 71;
            } case 72 -> {
                switch (direction) {
                    case "SOUTH" -> { yield 71; }
                    case "WEST" -> { yield 73; }
                    case "NORTH" -> { yield 74; }
                    case "EAST" -> { yield 75;}
                    default -> { yield 72; }
                }
            } case 73 -> {
                if (direction.equals("EAST")) yield 72;
                else yield 73;
            } case 74 -> {
                if (direction.equals("SOUTH")) yield 72;
                else if (direction.equals("NORTH")) yield 75;
                else yield 74;
            } case 75 -> {
                switch (direction) {
                    case "WEST" -> { yield 72; }
                    case "SOUTH" -> { yield 74; }
                    case "NORTH" -> { yield 6; }
                    default -> { yield 75; }
                }
            }
            default -> roomID;
        };
    }
}