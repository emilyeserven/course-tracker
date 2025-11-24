import type {Course} from "@/routes/courses";

export function getCourse(id: string) {
    console.log('id', id);
    const localItem = localStorage.getItem("courseData");
    console.log('localItem', localItem);
    const parsedLocal = JSON.parse(localItem + "");
    console.log(parsedLocal);
    const item = parsedLocal.courses.find((course: Course) => course.id + "" === id);
    console.log('item', item);
    return item;
}