'use client'

import React, { useEffect, useState } from 'react'

type BMIGaugeChartProps = {
    bmi: number
    status: 'underweight' | 'normal' | 'overweight' | 'obesity'
    lang: string
}

export default function BMIGaugeChart({ bmi, status, lang }: BMIGaugeChartProps) {
    const [animatedBMI, setAnimatedBMI] = useState(bmi)

    // Анимация изменения BMI
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedBMI(bmi)
        }, 100)
        return () => clearTimeout(timer)
    }, [bmi])

    // Параметры для полукруга (как в оригинальном SVG)
    const centerX = 140
    const centerY = 140
    const radius = 140
    const startAngle = 0 // Начало слева
    const endAngle = 180 // Конец справа (полукруг)

    // BMI → угол стрелки: BMI 10 = 0°, BMI 45 = 180°
    // Меньше 10 → 0°, больше 45 → 180°
    const bmiToRotationAngle = (bmiValue: number): number => {
        const minBMI = 10
        const maxBMI = 45
        const clampedBMI = Math.max(minBMI, Math.min(maxBMI, bmiValue))
        const normalized = (clampedBMI - minBMI) / (maxBMI - minBMI)
        return normalized * 180
    }

    // Угол поворота для стрелки (используем анимированное значение)
    const rotationAngle = bmiToRotationAngle(animatedBMI)

    // Маркеры на шкале
    const markers = [
        { bmi: 16, angle: -72, x: 25, y: 111 },
        { bmi: 17, angle: -66, x: 30, y: 96 },
        { bmi: 18.5, angle: -57, x: 35, y: 83 },
        { bmi: 25, angle: -18, x: 97, y: 29 },
        { bmi: 30, angle: 12, x: 157, y: 20 },
        { bmi: 35, angle: 42, x: 214, y: 45 },
        { bmi: 40, angle: 72, x: 252, y: 95 },
    ]

    return (
        <div className="w-full flex flex-col items-center py-4">
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                xmlnsXlink="http://www.w3.org/1999/xlink" 
                width="300px" 
                height="163px" 
                viewBox="0 0 300 163"
                className="overflow-visible"
            >
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                    </marker>
                </defs>

                <g transform="translate(18,18)" style={{ fontFamily: 'arial,helvetica,sans-serif', fontSize: '12px' }}>
                    {/* Цветные сегменты BMI */}
                    <path d="M0 140 A140 140, 0, 0, 1, 6.9 96.7 L140 140 Z" fill="#bc2020" />
                    <path d="M6.9 96.7 A140 140, 0, 0, 1, 12.1 83.1 L140 140 Z" fill="#d38888" />
                    <path d="M12.1 83.1 A140 140, 0, 0, 1, 22.6 63.8 L140 140 Z" fill="#ffe400" />
                    <path d="M22.6 63.8 A140 140, 0, 0, 1, 96.7 6.9 L140 140 Z" fill="#008137" />
                    <path d="M96.7 6.9 A140 140, 0, 0, 1, 169.1 3.1 L140 140 Z" fill="#ffe400" />
                    <path d="M169.1 3.1 A140 140, 0, 0, 1, 233.7 36 L140 140 Z" fill="#d38888" />
                    <path d="M233.7 36 A140 140, 0, 0, 1, 273.1 96.7 L140 140 Z" fill="#bc2020" />
                    <path d="M273.1 96.7 A140 140, 0, 0, 1, 280 140 L140 140 Z" fill="#8a0101" />

                    {/* Белый внутренний круг */}
                    <path d="M45 140 A90 90, 0, 0, 1, 230 140 Z" fill="#fff" />

                    {/* Центральная точка */}
                    <circle cx="140" cy="140" r="5" fill="#666" />

                    {/* Маркеры на шкале */}
                    {markers.map((marker) => (
                        <text
                            key={marker.bmi}
                            x={marker.x}
                            y={marker.y}
                            transform={`rotate(${marker.angle}, ${marker.x}, ${marker.y})`}
                            style={{ 
                                paintOrder: 'stroke',
                                stroke: '#fff',
                                strokeWidth: '2px',
                                fill: '#000'
                            }}
                        >
                            {marker.bmi}
                        </text>
                    ))}

                    {/* Стрелка (динамическая) */}
                    <g style={{ 
                        transformOrigin: '140px 140px',
                        transform: `rotate(${rotationAngle}deg)`,
                        transition: 'transform 0.5s ease'
                    }}>
                        <line
                            x1="140"
                            y1="140"
                            x2="65"
                            y2="140"
                            stroke="#666"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                        />
                    </g>

                    {/* Центральное значение BMI */}
                    <text
                        x="67"
                        y="120"
                        style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            color: '#000'
                        }}
                    >
                        BMI = {animatedBMI.toFixed(1)}
                    </text>
                </g>
            </svg>
        </div>
    )
}
