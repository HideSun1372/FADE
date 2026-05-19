package com.hidesun1372.fade.controllers;

import com.hidesun1372.fade.SaveData;
import com.hidesun1372.fade.repositories.SaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/save")
public class SaveController {

    @Autowired
    private SaveRepository saveRepository;

    @GetMapping
    public ResponseEntity<List<SaveData>> getAllSaves() {
        return ResponseEntity.ok(saveRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaveData> getSave(@PathVariable Long id) {
        return saveRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}")
    public ResponseEntity<SaveData> postSave(@PathVariable Long id, @RequestBody SaveData saveData) {
        saveData.setId(id);
        return ResponseEntity.ok(saveRepository.save(saveData));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSave(@PathVariable Long id) {
        saveRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
