package com.hidesun1372.fade;

import jakarta.persistence.*;

@Entity
@Table(name = "save_data")
public class SaveData {

    @Id
    private Long id;

    private int roomId;
    private double playerX;
    private double playerY;
    private String playerDirection;

    @Column(length = 500)
    private String clearedRooms;
    @Column(length = 500)
    private String battlesWon;
    @Column(length = 500)
    private String visited;

    private boolean hasKey;
    private boolean hasRoom62Key;
    private boolean northDoorUnlocked;
    private int waterAmount;
    private int fadePercent;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getRoomId() { return roomId; }
    public void setRoomId(int roomId) { this.roomId = roomId; }

    public double getPlayerX() { return playerX; }
    public void setPlayerX(double playerX) { this.playerX = playerX; }

    public double getPlayerY() { return playerY; }
    public void setPlayerY(double playerY) { this.playerY = playerY; }

    public String getPlayerDirection() { return playerDirection; }
    public void setPlayerDirection(String playerDirection) { this.playerDirection = playerDirection; }

    public String getClearedRooms() { return clearedRooms; }
    public void setClearedRooms(String clearedRooms) { this.clearedRooms = clearedRooms; }

    public String getBattlesWon() { return battlesWon; }
    public void setBattlesWon(String battlesWon) { this.battlesWon = battlesWon; }

    public String getVisited() { return visited; }
    public void setVisited(String visited) { this.visited = visited; }

    public boolean isHasKey() { return hasKey; }
    public void setHasKey(boolean hasKey) { this.hasKey = hasKey; }

    public boolean isHasRoom62Key() { return hasRoom62Key; }
    public void setHasRoom62Key(boolean hasRoom62Key) { this.hasRoom62Key = hasRoom62Key; }

    public boolean isNorthDoorUnlocked() { return northDoorUnlocked; }
    public void setNorthDoorUnlocked(boolean northDoorUnlocked) { this.northDoorUnlocked = northDoorUnlocked; }

    public int getWaterAmount() { return waterAmount; }
    public void setWaterAmount(int waterAmount) { this.waterAmount = waterAmount; }

    public int getFadePercent() { return fadePercent; }
    public void setFadePercent(int fadePercent) { this.fadePercent = fadePercent; }
}
