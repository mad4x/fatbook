package spike.fatbook.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import spike.fatbook.backend.dto.OraCanonicaDTO;
import spike.fatbook.backend.repository.OraCanonicaRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrarioController {

}