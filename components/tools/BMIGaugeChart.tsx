'use client'

import React, { useEffect, useState } from 'react'

type BMIGaugeChartProps = {
    bmi: number
    status: 'underweight' | 'normal' | 'overweight' | 'obesity'
}

export default function BMIGaugeChart({ bmi, status }: BMIGaugeChartProps) {
    const [animatedBMI, setAnimatedBMI] = useState(bmi)

    // Анимация изменения BMI
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedBMI(bmi)
        }, 100)
        return () => clearTimeout(timer)
    }, [bmi])
    // Параметры для полукруга
    const centerX = 200
    const centerY = 180
    const radius = 140
    const startAngle = 0 // Начало слева
    const endAngle = 180 // Конец справа (полукруг)

    // Конвертируем углы в радианы
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    // Функция для конвертации BMI в угол (от 16 до 40)
    const bmiToAngle = (bmiValue: number): number => {
        const minBMI = 16
        const maxBMI = 40
        const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmiValue))
        const normalized = (clampedBMI - minBMI) / (maxBMI - minBMI)
        return startAngle + normalized * (endAngle - startAngle)
    }

    // Угол для стрелки (используем анимированное значение)
    const arrowAngle = bmiToAngle(animatedBMI)
    const arrowAngleRad = (arrowAngle * Math.PI) / 180

    // Координаты конца стрелки
    const arrowLength = radius - 20
    const arrowEndX = centerX + arrowLength * Math.cos(Math.PI - arrowAngleRad)
    const arrowEndY = centerY - arrowLength * Math.sin(Math.PI - arrowAngleRad)

    // Цвета для сегментов
    const getSegmentColor = (segment: string) => {
        switch (segment) {
            case 'underweight': return '#dc2626' // красный
            case 'normal': return '#16a34a' // зеленый
            case 'overweight': return '#eab308' // желтый
            case 'obesity': return '#991b1b' // темно-красный
            default: return '#gray'
        }
    }

    // Создаем пути для каждого сегмента
    const createArcPath = (startBMI: number, endBMI: number, color: string) => {
        const startAngleValue = bmiToAngle(startBMI)
        const endAngleValue = bmiToAngle(endBMI)
        const startRad = (startAngleValue * Math.PI) / 180
        const endRad = (endAngleValue * Math.PI) / 180

        const x1 = centerX + radius * Math.cos(Math.PI - startRad)
        const y1 = centerY - radius * Math.sin(Math.PI - startRad)
        const x2 = centerX + radius * Math.cos(Math.PI - endRad)
        const y2 = centerY - radius * Math.sin(Math.PI - endRad)

        const largeArcFlag = endAngleValue - startAngleValue > 90 ? 1 : 0

        return (
            <path
                key={`${startBMI}-${endBMI}`}
                d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`}
                stroke={color}
                strokeWidth="28"
                fill="none"
                strokeLinecap="round"
            />
        )
    }

    // Маркеры на шкале
    const markers = [16, 18.5, 25, 30, 35, 40]
    const markerLabels = ['Underweight', 'Normal', 'Overweight', 'Obesity']

    return (
        <div className="w-full flex flex-col items-center py-4">
            <svg width="400" height="220" viewBox="0 0 400 220" className="overflow-visible">
                {/* Сегменты BMI */}
                {createArcPath(16, 18.5, getSegmentColor('underweight'))}
                {createArcPath(18.5, 25, getSegmentColor('normal'))}
                {createArcPath(25, 30, getSegmentColor('overweight'))}
                {createArcPath(30, 40, getSegmentColor('obesity'))}

                {/* Маркеры на шкале */}
                {markers.map((markerBMI) => {
                    const angle = bmiToAngle(markerBMI)
                    const angleRad = (angle * Math.PI) / 180
                    const x1 = centerX + (radius - 15) * Math.cos(Math.PI - angleRad)
                    const y1 = centerY - (radius - 15) * Math.sin(Math.PI - angleRad)
                    const x2 = centerX + (radius + 5) * Math.cos(Math.PI - angleRad)
                    const y2 = centerY - (radius + 5) * Math.sin(Math.PI - angleRad)

                    return (
                        <g key={markerBMI}>
                            <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#666"
                                strokeWidth="2"
                            />
                            <text
                                x={x2 + (markerBMI === 16 ? -10 : markerBMI === 40 ? 10 : 0)}
                                y={y2 + (markerBMI <= 25 ? -5 : 15)}
                                textAnchor={markerBMI === 16 ? 'end' : markerBMI === 40 ? 'start' : 'middle'}
                                fontSize="12"
                                fill="#666"
                                fontWeight="500"
                            >
                                {markerBMI}
                            </text>
                        </g>
                    )
                })}

                {/* Подписи категорий */}
                {[
                    { bmi: 17.25, label: 'Underweight', color: getSegmentColor('underweight') },
                    { bmi: 21.75, label: 'Normal', color: getSegmentColor('normal') },
                    { bmi: 27.5, label: 'Overweight', color: getSegmentColor('overweight') },
                    { bmi: 35, label: 'Obesity', color: getSegmentColor('obesity') },
                ].map(({ bmi: labelBMI, label, color }) => {
                    const angle = bmiToAngle(labelBMI)
                    const angleRad = (angle * Math.PI) / 180
                    const x = centerX + (radius - 45) * Math.cos(Math.PI - angleRad)
                    const y = centerY - (radius - 45) * Math.sin(Math.PI - angleRad)

                    return (
                        <text
                            key={label}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            fontSize="10"
                            fill={color}
                            fontWeight="600"
                        >
                            {label}
                        </text>
                    )
                })}

                {/* Стрелка с анимацией */}
                <g>
                    {/* Основание стрелки (круг) */}
                    <circle cx={centerX} cy={centerY} r="8" fill="#4b5563" />
                    {/* Стрелка с transition */}
                    <line
                        x1={centerX}
                        y1={centerY}
                        x2={arrowEndX}
                        y2={arrowEndY}
                        stroke="#1f2937"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ transition: 'all 0.5s ease' }}
                    />
                    {/* Наконечник стрелки */}
                    <polygon
                        points={`${arrowEndX},${arrowEndY} ${arrowEndX - 8 * Math.cos(Math.PI - arrowAngleRad - 0.2)},${arrowEndY + 8 * Math.sin(Math.PI - arrowAngleRad - 0.2)} ${arrowEndX - 8 * Math.cos(Math.PI - arrowAngleRad + 0.2)},${arrowEndY + 8 * Math.sin(Math.PI - arrowAngleRad + 0.2)}`}
                        fill="#1f2937"
                        style={{ transition: 'all 0.5s ease' }}
                    />
                </g>

                {/* Центральное значение BMI */}
                <text
                    x={centerX}
                    y={centerY + 5}
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill="#1f2937"
                >
                    BMI = {animatedBMI.toFixed(1)}
                </text>
            </svg>
        </div>
    )
}
