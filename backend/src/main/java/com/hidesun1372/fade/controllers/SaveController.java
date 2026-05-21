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
    public ResponseEntity<List<SaveData>> getAllSaves(@RequestParam String deviceId) {
        return ResponseEntity.ok(saveRepository.findByDeviceId(deviceId));
    }

    @GetMapping("/{slotId}")
    public ResponseEntity<SaveData> getSave(@PathVariable int slotId, @RequestParam String deviceId) {
        return saveRepository.findByDeviceIdAndSlotId(deviceId, slotId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{slotId}")
    public ResponseEntity<SaveData> postSave(@PathVariable int slotId, @RequestParam String deviceId, @RequestBody SaveData saveData) {
        saveData.setDeviceId(deviceId);
        saveData.setSlotId(slotId);
        saveData.setId(saveRepository.findByDeviceIdAndSlotId(deviceId, slotId)
                .map(SaveData::getId)
                .orElse(null));
        return ResponseEntity.ok(saveRepository.save(saveData));
    }

    @DeleteMapping("/{slotId}")
    public ResponseEntity<Void> deleteSave(@PathVariable int slotId, @RequestParam String deviceId) {
        saveRepository.findByDeviceIdAndSlotId(deviceId, slotId)
                .ifPresent(saveRepository::delete);
        return ResponseEntity.noContent().build();
    }
}
