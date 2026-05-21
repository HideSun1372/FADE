package com.hidesun1372.fade.repositories;

import com.hidesun1372.fade.SaveData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SaveRepository extends JpaRepository<SaveData, Long> {
    List<SaveData> findByDeviceId(String deviceId);
    Optional<SaveData> findByDeviceIdAndSlotId(String deviceId, int slotId);
}
