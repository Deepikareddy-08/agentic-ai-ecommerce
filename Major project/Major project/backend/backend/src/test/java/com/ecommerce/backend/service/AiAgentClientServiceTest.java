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

    @Test
    public void testDetectGeneralOrNonShoppingQuery_WhoIsQuestions() {
        assertNotNull(aiService.detectGeneralOrNonShoppingQuery("who is yaswanth"));
        assertNotNull(aiService.detectGeneralOrNonShoppingQuery("who is elon musk"));
        assertNotNull(aiService.detectGeneralOrNonShoppingQuery("who are you"));
        assertNotNull(aiService.detectGeneralOrNonShoppingQuery("what is your name"));
        assertNotNull(aiService.detectGeneralOrNonShoppingQuery("what is the capital of india"));
        assertNotNull(aiService.detectGeneralOrNonShoppingQuery("tell me a joke"));

        // Genuine electronic questions should NOT be flagged
        assertNull(aiService.detectGeneralOrNonShoppingQuery("i need a laptop for coding"));
        assertNull(aiService.detectGeneralOrNonShoppingQuery("best smartphone under 30000"));
    }

    @Test
    public void testIsGreeting() {
        assertTrue(aiService.isGreeting("hi"));
        assertTrue(aiService.isGreeting("hello"));
        assertTrue(aiService.isGreeting("hey"));
        assertTrue(aiService.isGreeting("good morning"));

        assertFalse(aiService.isGreeting("i want a laptop"));
    }
}

