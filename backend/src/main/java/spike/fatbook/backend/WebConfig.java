package spike.fatbook.backend; // Usa il tuo package

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Tutte le API
                .allowedOrigins("http://localhost:3000") // Solo dal Frontend
                .allowedOrigins("http://*")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}