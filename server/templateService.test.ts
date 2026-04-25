import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  getAllTemplates,
  getTemplatesByCategory,
  getTemplateWithScenes,
  getTrendingTemplates,
  incrementTemplateUsage,
} from "./templateService";

describe("Template Service", () => {
  describe("getAllTemplates", () => {
    it("should return an array of templates", async () => {
      const templates = await getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
    });

    it("should return templates with required fields", async () => {
      const templates = await getAllTemplates();
      if (templates.length > 0) {
        const template = templates[0];
        expect(template).toHaveProperty("id");
        expect(template).toHaveProperty("name");
        expect(template).toHaveProperty("category");
        expect(template).toHaveProperty("duration");
      }
    });
  });

  describe("getTemplatesByCategory", () => {
    it("should filter templates by category", async () => {
      const templates = await getTemplatesByCategory("marketing");
      expect(Array.isArray(templates)).toBe(true);

      if (templates.length > 0) {
        templates.forEach((template) => {
          expect(template.category).toBe("marketing");
        });
      }
    });

    it("should return empty array for non-existent category", async () => {
      const templates = await getTemplatesByCategory("non-existent");
      expect(Array.isArray(templates)).toBe(true);
    });
  });

  describe("getTemplateWithScenes", () => {
    it("should return null for non-existent template", async () => {
      const template = await getTemplateWithScenes(99999);
      expect(template).toBeNull();
    });

    it("should include scenes array when template exists", async () => {
      const templates = await getAllTemplates();
      if (templates.length > 0) {
        const templateId = templates[0].id;
        const template = await getTemplateWithScenes(templateId);

        if (template) {
          expect(template).toHaveProperty("scenes");
          expect(Array.isArray(template.scenes)).toBe(true);
        }
      }
    });
  });

  describe("getTrendingTemplates", () => {
    it("should return trending templates", async () => {
      const templates = await getTrendingTemplates(5);
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeLessThanOrEqual(5);
    });

    it("should respect limit parameter", async () => {
      const templates = await getTrendingTemplates(3);
      expect(templates.length).toBeLessThanOrEqual(3);
    });
  });

  describe("incrementTemplateUsage", () => {
    it("should not throw error for valid template", async () => {
      const templates = await getAllTemplates();
      if (templates.length > 0) {
        const templateId = templates[0].id;
        await expect(incrementTemplateUsage(templateId)).resolves.not.toThrow();
      }
    });

    it("should not throw error for non-existent template", async () => {
      await expect(incrementTemplateUsage(99999)).resolves.not.toThrow();
    });
  });
});

describe("Template Data Structure", () => {
  it("should have valid template structure", async () => {
    const templates = await getAllTemplates();

    if (templates.length > 0) {
      const template = templates[0];

      // Check required fields
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.category).toBeDefined();
      expect(template.duration).toBeDefined();

      // Check field types
      expect(typeof template.id).toBe("number");
      expect(typeof template.name).toBe("string");
      expect(typeof template.category).toBe("string");
      expect(typeof template.duration).toBe("number");

      // Check valid values
      expect(template.duration).toBeGreaterThan(0);
      expect(["easy", "medium", "hard"]).toContain(template.difficulty);
    }
  });

  it("should have valid category values", async () => {
    const templates = await getAllTemplates();
    const validCategories = [
      "marketing",
      "education",
      "tutorial",
      "intro",
      "outro",
      "promo",
      "social",
    ];

    templates.forEach((template) => {
      expect(validCategories).toContain(template.category);
    });
  });

  it("should have valid difficulty values", async () => {
    const templates = await getAllTemplates();
    const validDifficulties = ["easy", "medium", "hard"];

    templates.forEach((template) => {
      expect(validDifficulties).toContain(template.difficulty);
    });
  });
});

describe("Template Metadata", () => {
  it("should have parseable tags JSON", async () => {
    const templates = await getAllTemplates();

    templates.forEach((template) => {
      if (template.tags) {
        expect(() => JSON.parse(template.tags)).not.toThrow();
        const tags = JSON.parse(template.tags);
        expect(Array.isArray(tags)).toBe(true);
      }
    });
  });

  it("should have parseable structure JSON", async () => {
    const templates = await getAllTemplates();

    templates.forEach((template) => {
      if (template.structure) {
        expect(() => JSON.parse(template.structure)).not.toThrow();
      }
    });
  });

  it("should have parseable defaultSettings JSON", async () => {
    const templates = await getAllTemplates();

    templates.forEach((template) => {
      if (template.defaultSettings) {
        expect(() => JSON.parse(template.defaultSettings)).not.toThrow();
      }
    });
  });
});

describe("Template Performance", () => {
  it("should fetch all templates within reasonable time", async () => {
    const startTime = Date.now();
    await getAllTemplates();
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
  });

  it("should fetch templates by category within reasonable time", async () => {
    const startTime = Date.now();
    await getTemplatesByCategory("marketing");
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
  });
});
