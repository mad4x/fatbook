package spike.fatbook.backend.service;

public interface EmailService {
    void sendDocentePassword(String to, String temporaryPassword);
}