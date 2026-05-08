package com.hidesun1372.fade;

import com.hidesun1372.fade.service.MovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class MovementController {
    @Autowired
    private MovementService MovementService;

    @PostMapping("/api/move")
    public int movePlayer(@RequestBody MoveRequest request) {

        return MovementService.getNextRoom(request.roomID, request.direction, request.hasKey);
    }
}
