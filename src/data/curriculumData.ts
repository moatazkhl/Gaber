import { Unit, Lesson } from '../types';
import { unit1 } from './units/unit1';
import { unit2 } from './units/unit2';
import { unit3 } from './units/unit3';
import { unit4 } from './units/unit4';
import { unit5 } from './units/unit5';
import { unit6 } from './units/unit6';

export const UNITS: Unit[] = [
  unit1,
  unit2,
  unit3,
  unit4,
  unit5,
  unit6
];

export function getAllLessons(): { unit: Unit; lesson: Lesson }[] {
  const result: { unit: Unit; lesson: Lesson }[] = [];
  UNITS.forEach(unit => {
    unit.lessons.forEach(lesson => {
      result.push({ unit, lesson });
    });
  });
  return result;
}

export function getLessonById(lessonId: string): { unit: Unit; lesson: Lesson } | null {
  for (const unit of UNITS) {
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (lesson) {
      return { unit, lesson };
    }
  }
  return null;
}

export function getUnitById(unitId: string): Unit | null {
  return UNITS.find(u => u.id === unitId) || null;
}

export function getAdjacentLessons(currentLessonId: string): {
  prev: { unit: Unit; lesson: Lesson } | null;
  next: { unit: Unit; lesson: Lesson } | null;
} {
  const all = getAllLessons();
  const currentIndex = all.findIndex(item => item.lesson.id === currentLessonId);
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: currentIndex > 0 ? all[currentIndex - 1] : null,
    next: currentIndex < all.length - 1 ? all[currentIndex + 1] : null,
  };
}
