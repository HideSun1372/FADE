package com.hidesun1372.fade.services;

import org.springframework.stereotype.Service;

import com.hidesun1372.fade.Enemies;

@Service
public class EnemiesService {
    public Enemies getEnemy(int EnemyID) {
        return switch(EnemyID) {
            case 6 -> new Enemies("The King", 300);
            case 4 -> new Enemies("Volcanic Master", 150);
            case 22, 32, 33 -> new Enemies("Goblin", 50);
            case 41 -> new Enemies("Darkness Overflow", 70);
            case 63, 73 -> new Enemies("VoidBringer", 125);
            case 7 -> new Enemies("Mysterious Figure", 375);
            default -> null;
        };
    }
}