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

        assertNotNull(aiService.detectNonElectronics("is there any sun screenns"));
        assertNotNull(aiService.detectNonElectronics("i want a sun screen"));
        assertNotNull(aiService.detectNonElectronics("sun scren"));
        assertNotNull(aiService.detectNonElectronics("spf 50"));
        assertNotNull(aiService.detectNonElectronics("is there anu cosmotics"));
        assertNotNull(aiService.detectNonElectronics("lipstick and face wash"));
    }

    @Test
    public void testIsElectronicsQuery() {
        // Genuine electronics queries
        assertTrue(aiService.isElectronicsQuery("i need a laptop under 70000 for coding", null));
        assertTrue(aiService.isElectronicsQuery("wireless headphones with ANC", null));
        assertTrue(aiService.isElectronicsQuery("smart tv 55 inch 4k", null));
        assertTrue(aiService.isElectronicsQuery("Which flagship phone has the best camera and battery?", null));
        assertTrue(aiService.isElectronicsQuery("smartwatch with heart rate monitor", null));
        assertTrue(aiService.isElectronicsQuery("MacBook Air M2 vs ThinkPad E14", null));
        assertTrue(aiService.isElectronicsQuery("show electronics catalogue", null));

        // Follow up on active category
        assertTrue(aiService.isElectronicsQuery("which is better under 50000", "Laptops"));
        assertTrue(aiService.isElectronicsQuery("explain why", "Laptops"));
        assertTrue(aiService.isElectronicsQuery("explain why", null));
        assertTrue(aiService.isElectronicsQuery("can you explain about apple macbook why is it best", null));
        assertTrue(aiService.isElectronicsQuery("why is it important", "Laptops"));
        assertTrue(aiService.isElectronicsQuery("why is it best", null));

        // Non-electronics / Out-of-domain queries
        assertFalse(aiService.isElectronicsQuery("is there any sun screenns", null));
        assertFalse(aiService.isElectronicsQuery("is there any sun screenns", "Monitors & Displays"));
        assertFalse(aiService.isElectronicsQuery("i want a sun screen", null));
        assertFalse(aiService.isElectronicsQuery("i want a sun screen", "Smartphones"));
        assertFalse(aiService.isElectronicsQuery("spf 50", null));
        assertFalse(aiService.isElectronicsQuery("is there anu cosmotics", null));
        assertFalse(aiService.isElectronicsQuery("can you give me a football", null));
        assertFalse(aiService.isElectronicsQuery("do you have guitars", null));
        assertFalse(aiService.isElectronicsQuery("i want fresh apples and mangoes", null));
    }

    @Test
    public void testDetectNonElectronics_GenuineElectronicsAllowed() {
        assertNull(aiService.detectNonElectronics("i need a laptop under 70000 for coding"));
        assertNull(aiService.detectNonElectronics("wireless headphones with ANC"));
        assertNull(aiService.detectNonElectronics("Which flagship phone has the best camera and battery?"));
        assertNull(aiService.detectNonElectronics("smart tv 55 inch 4k"));
        assertNull(aiService.detectNonElectronics("smartwatch with heart rate monitor"));
        assertNull(aiService.detectNonElectronics("MacBook Air M2 vs ThinkPad E14"));
        assertNull(aiService.detectNonElectronics("can you explain about apple macbook why is it best"));
        assertNull(aiService.detectNonElectronics("apple macbook pro 14 m3 pro"));
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

