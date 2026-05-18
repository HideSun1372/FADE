package com.hidesun1372.fade;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin
public class Enemies {
    public String name;
    public int health;
    public int EnemyID;

    public Enemies(String name, int health) {
        this.name = name;
        this.health = health;
    }
}