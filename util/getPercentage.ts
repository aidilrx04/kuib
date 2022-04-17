import { Kuib, Question, Score } from "./types";

export type Percentage = {
    correct: number,
    wrong: number,
    total: number,
    correctPercentage: number,
    wrongPercentage: number
    cppq: number,
    cwpq: number,
    totalQuestion: number
}

export default function getPercentage(scores: Score[], questions: Question[]) {

    const percentage: Percentage = {
        correct: 0,
        wrong: 0,
        total: scores.length,
        correctPercentage: 0,
        wrongPercentage: 0,
        cppq: 0,
        cwpq: 0,
        totalQuestion: questions.length
    }

    scores.forEach((score) => {
        const qi = questions.map(e => e.id).indexOf(score.qid);
        const question = questions[qi]

        if (score.aid === question.correctAnswerId)
            percentage.correct += 1;
        else percentage.wrong += 1
    })

    percentage.correctPercentage = Number((percentage.correct / percentage.total * 100).toFixed(2))
    percentage.wrongPercentage = Number((percentage.wrong / percentage.total * 100).toFixed(2))
    percentage.cppq = Number((percentage.correct / percentage.totalQuestion * 100).toFixed(2))
    percentage.cwpq = Number((percentage.wrong / percentage.totalQuestion * 100).toFixed(2))


    // console.log(percentage.wrongPercentage)

    return percentage
}