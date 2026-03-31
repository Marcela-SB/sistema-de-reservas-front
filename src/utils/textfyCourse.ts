import { Courses } from "../types/Courses";

export default function textfyCourse( course: Courses ){
    switch (course) {
        case Courses.TEATRO:
            return 'Teatro'
        case Courses.ARTES:
            return 'Artes Visuais'
        case Courses.DESIGN:
            return 'Design'
        case Courses.DANCA:
            return 'Dança'
        case Courses.POS:
                return 'Pós'
        case Courses.PROJETO:
                return 'Projeto de Extensão'
        default:
            return 'Atividades Diversas'
    }
}