package com.hidesun1372.fade.services;

import org.springframework.stereotype.Service;

import com.hidesun1372.fade.Enemies;

@Service
public class EnemiesService {
    public Enemies getEnemy(int EnemyID) {
        return switch(EnemyID) {
            case 1 -> new Enemies("The King", 300, 30.0);  
            case 2 -> new Enemies("VoidBringer", 50, 5.0);
            default -> null;
        };
    }
}
