package com.hidesun1372.fade.controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class StartController {

    @GetMapping("/api/start")
    public void start() {}
}
