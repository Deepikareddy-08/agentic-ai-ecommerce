package com.ecommerce.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AiAgentClientServiceTest {

    private AiAgentClientService aiService;

    @BeforeEach
    public void setup() {
        aiService = new AiAgentClientService();
    }

    @Test
    public void testDetectNonElectronics_FoodAndVegetables() {
        assertNotNull(aiService.detectNonElectronics("i want a vegetbale cutter"));
        assertEquals("food, groceries & kitchenware", aiService.detectNonElectronics("i want a vegetbale cutter"));

        assertNotNull(aiService.detectNonElectronics("show me fresh vegetables and fruits"));
        assertNotNull(aiService.detectNonElectronics("buy fresh apples and bananas"));
        assertNotNull(aiService.detectNonElectronics("kitchen knife and cutting board"));
    }

    @Test
    public void testDetectNonElectronics_ClothingAndFashion() {
        assertNotNull(aiService.detectNonElectronics("show me dresses for summer"));
        assertEquals("clothing, fashion & footwear", aiService.detectNonElectronics("show me dresses for summer"));

        assertNotNull(aiService.detectNonElectronics("buy shirts, jeans, and sneakers"));
        assertNotNull(aiService.detectNonElectronics("sarees and kurtis"));
    }

    @Test
    public void testDetectNonElectronics_BeautyAndCosmetics() {
        assertNotNull(aiService.detectNonElectronics("skin care and sunscreen"));
        assertEquals("beauty & personal care", aiService.detectNonElectronics("skin care and sunscreen"));

        assertNotNull(aiService.detectNonElectronics("lipstick and face wash"));
    }

    @Test
    public void testDetectNonElectronics_GenuineElectronicsAllowed() {
        assertNull(aiService.detectNonElectronics("i need a laptop under 70000 for coding"));
        assertNull(aiService.detectNonElectronics("wireless headphones with ANC"));
        assertNull(aiService.detectNonElectronics("Which flagship phone has the best camera and battery?"));
        assertNull(aiService.detectNonElectronics("smart tv 55 inch 4k"));
        assertNull(aiService.detectNonElectronics("smartwatch with heart rate monitor"));
        assertNull(aiService.detectNonElectronics("MacBook Air M2 vs ThinkPad E14"));
    }
}
