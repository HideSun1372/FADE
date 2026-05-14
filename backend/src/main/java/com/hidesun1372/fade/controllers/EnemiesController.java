package com.hidesun1372.fade.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hidesun1372.fade.Enemies;
import com.hidesun1372.fade.services.EnemiesService;

@CrossOrigin
@RestController
public class EnemiesController {
    @Autowired
    private EnemiesService EnemiesService;

    @GetMapping("/api/enemy")
    public Enemies getEnemy(@RequestParam int EnemyID) {
        return EnemiesService.getEnemy(EnemyID);
    }
}