import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  projectElements,
  elementCustomization,
  projectHistory,
  InsertProjectElement,
  InsertElementCustomization,
  InsertProjectHistory,
} from "../drizzle/schema";

/**
 * Get all elements for a project
 */
export async function getProjectElements(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(projectElements)
      .where(eq(projectElements.projectId, projectId))
      .orderBy((e) => e.layerIndex);
  } catch (error) {
    console.error("Error fetching project elements:", error);
    return [];
  }
}

/**
 * Get element with customization
 */
export async function getElementWithCustomization(elementId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const element = await db
      .select()
      .from(projectElements)
      .where(eq(projectElements.id, elementId))
      .limit(1);

    if (!element.length) return null;

    const customization = await db
      .select()
      .from(elementCustomization)
      .where(eq(elementCustomization.elementId, elementId))
      .limit(1);

    return {
      ...element[0],
      customization: customization.length > 0 ? customization[0] : null,
    };
  } catch (error) {
    console.error("Error fetching element with customization:", error);
    return null;
  }
}

/**
 * Create new element
 */
export async function createElement(element: InsertProjectElement) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(projectElements).values(element);
    return result;
  } catch (error) {
    console.error("Error creating element:", error);
    return null;
  }
}

/**
 * Update element position and size
 */
export async function updateElementPosition(
  elementId: number,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(projectElements)
      .set({
        x,
        y,
        width,
        height,
        rotation,
      })
      .where(eq(projectElements.id, elementId));

    return await db
      .select()
      .from(projectElements)
      .where(eq(projectElements.id, elementId))
      .limit(1);
  } catch (error) {
    console.error("Error updating element position:", error);
    return null;
  }
}

/**
 * Update element layer order
 */
export async function updateElementLayerOrder(
  elementId: number,
  layerIndex: number,
  zIndex: number
) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(projectElements)
      .set({
        layerIndex,
        zIndex,
      })
      .where(eq(projectElements.id, elementId));

    return await db
      .select()
      .from(projectElements)
      .where(eq(projectElements.id, elementId))
      .limit(1);
  } catch (error) {
    console.error("Error updating element layer order:", error);
    return null;
  }
}

/**
 * Update element visibility and lock status
 */
export async function updateElementVisibility(
  elementId: number,
  visible: boolean,
  locked: boolean
) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(projectElements)
      .set({
        visible: visible ? 1 : 0,
        locked: locked ? 1 : 0,
      })
      .where(eq(projectElements.id, elementId));

    return await db
      .select()
      .from(projectElements)
      .where(eq(projectElements.id, elementId))
      .limit(1);
  } catch (error) {
    console.error("Error updating element visibility:", error);
    return null;
  }
}

/**
 * Update element customization
 */
export async function updateElementCustomization(
  elementId: number,
  customization: Partial<InsertElementCustomization>
) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if customization exists
    const existing = await db
      .select()
      .from(elementCustomization)
      .where(eq(elementCustomization.elementId, elementId))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await db
        .update(elementCustomization)
        .set(customization)
        .where(eq(elementCustomization.elementId, elementId));
    } else {
      // Create new
      await db.insert(elementCustomization).values({
        elementId,
        ...customization,
      });
    }

    return await getElementWithCustomization(elementId);
  } catch (error) {
    console.error("Error updating element customization:", error);
    return null;
  }
}

/**
 * Delete element
 */
export async function deleteElement(elementId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Delete customization
    await db
      .delete(elementCustomization)
      .where(eq(elementCustomization.elementId, elementId));

    // Delete element
    await db.delete(projectElements).where(eq(projectElements.id, elementId));

    return true;
  } catch (error) {
    console.error("Error deleting element:", error);
    return false;
  }
}

/**
 * Duplicate element
 */
export async function duplicateElement(elementId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const element = await getElementWithCustomization(elementId);
    if (!element) return null;

    // Create new element with offset position
    const newElement: InsertProjectElement = {
      projectId: element.projectId,
      elementType: element.elementType,
      layerIndex: (element.layerIndex || 0) + 1,
      x: (element.x || 0) + 10,
      y: (element.y || 0) + 10,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      opacity: element.opacity,
      zIndex: (element.zIndex || 0) + 1,
      content: element.content,
      style: element.style,
      animation: element.animation,
      locked: element.locked,
      visible: element.visible,
    };

    await db.insert(projectElements).values(newElement);

    // Get the newly created element
    const createdElement = await db
      .select()
      .from(projectElements)
      .where(eq(projectElements.projectId, element.projectId))
      .orderBy((e) => e.id)
      .limit(1);

    if (!createdElement.length) return null;

    // Duplicate customization if exists
    if (element.customization) {
      const newCustomizationData: InsertElementCustomization = {
        elementId: createdElement[0].id,
        backgroundColor: element.customization.backgroundColor,
        textColor: element.customization.textColor,
        borderColor: element.customization.borderColor,
        borderWidth: element.customization.borderWidth,
        borderRadius: element.customization.borderRadius,
        fontFamily: element.customization.fontFamily,
        fontSize: element.customization.fontSize,
        fontWeight: element.customization.fontWeight,
        fontStyle: element.customization.fontStyle,
        textAlign: element.customization.textAlign,
        lineHeight: element.customization.lineHeight,
        letterSpacing: element.customization.letterSpacing,
        shadowColor: element.customization.shadowColor,
        shadowBlur: element.customization.shadowBlur,
        shadowOffsetX: element.customization.shadowOffsetX,
        shadowOffsetY: element.customization.shadowOffsetY,
        filters: element.customization.filters,
        metadata: element.customization.metadata,
      };
      await db.insert(elementCustomization).values(newCustomizationData);
    }

    return createdElement[0];
  } catch (error) {
    console.error("Error duplicating element:", error);
    return null;
  }
}

/**
 * Save project history for undo/redo
 */
export async function saveProjectHistory(
  projectId: number,
  action: string,
  previousState: any,
  newState: any
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const history: InsertProjectHistory = {
      projectId,
      action,
      previousState: JSON.stringify(previousState),
      newState: JSON.stringify(newState),
    };

    return await db.insert(projectHistory).values(history);
  } catch (error) {
    console.error("Error saving project history:", error);
    return null;
  }
}

/**
 * Get project history
 */
export async function getProjectHistory(projectId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(projectHistory)
      .where(eq(projectHistory.projectId, projectId))
      .orderBy((h) => h.timestamp)
      .limit(limit);
  } catch (error) {
    console.error("Error fetching project history:", error);
    return [];
  }
}

/**
 * Batch update elements
 */
export async function batchUpdateElements(
  elementIds: number[],
  updates: Partial<InsertProjectElement>
) {
  const db = await getDb();
  if (!db) return false;

  try {
    for (const elementId of elementIds) {
      await db
        .update(projectElements)
        .set(updates)
        .where(eq(projectElements.id, elementId));
    }
    return true;
  } catch (error) {
    console.error("Error batch updating elements:", error);
    return false;
  }
}

/**
 * Reorder layers
 */
export async function reorderLayers(projectId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    const elements = await db
      .select()
      .from(projectElements)
      .where(eq(projectElements.projectId, projectId))
      .orderBy((e) => e.layerIndex);

    for (let i = 0; i < elements.length; i++) {
      await db
        .update(projectElements)
        .set({
          layerIndex: i,
          zIndex: i,
        })
        .where(eq(projectElements.id, elements[i].id));
    }

    return true;
  } catch (error) {
    console.error("Error reordering layers:", error);
    return false;
  }
}
