'use client'

import React, { useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type FeedbackTranslations = {
    title: string
    fields: {
        name: {
            label: string
            required_text: string
        }
        email: {
            label: string
            required_text: string
        }
        message: {
            label: string
            required_text: string
            placeholder: string
        }
    }
    validation: {
        fill_out: string
    }
    button: {
        submit: string
    }
}

type Props = {
    lang: string
    translations: FeedbackTranslations
}

export default function FeedbackForm({ lang, translations }: Props) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
    const [submitMessage, setSubmitMessage] = useState('')

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus(null)
        setSubmitMessage('')

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message }),
            })

            const data = await response.json()

            if (response.ok && data.success) {
                setSubmitStatus('success')
                setSubmitMessage('Message sent successfully!')
                // Очищаем форму
                setName('')
                setEmail('')
                setMessage('')
            } else {
                setSubmitStatus('error')
                setSubmitMessage('Error sending message. Please try again.')
            }
        } catch (error) {
            console.error('Error submitting feedback:', error)
            setSubmitStatus('error')
            setSubmitMessage('Connection error. Please try again later.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
                <h2 className="text-white font-bold text-xl">
                    {translations.title}
                </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-gray-900 font-medium mb-1">
                        {translations.fields.name.label}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                        {translations.fields.name.required_text}
                    </p>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        title={translations.validation.fill_out}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-gray-900 font-medium mb-1">
                        {translations.fields.email.label}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                        {translations.fields.email.required_text}
                    </p>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        title={translations.validation.fill_out}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Message Field */}
                <div>
                    <label htmlFor="message" className="block text-gray-900 font-medium mb-1">
                        {translations.fields.message.label}
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                        {translations.fields.message.required_text}
                    </p>
                    <textarea
                        id="message"
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        title={translations.validation.fill_out}
                        placeholder={translations.fields.message.placeholder}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Sending...' : translations.button.submit}
                </button>

                {/* Status Message */}
                {submitStatus && (
                    <div
                        className={`p-3 rounded-md ${
                            submitStatus === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {submitMessage}
                    </div>
                )}
            </form>

            {/* Logo - как в виджетах калькуляторов */}
            <div className="px-6 pb-4 flex justify-end">
                <Link 
                    href={`/${lang}`} 
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <Image
                        src="/calculatorscope-logo.svg"
                        alt="Calculator Scope"
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                    />
                    <div className="flex flex-col">
                        <span className="font-medium">Calculator Scope</span>
                        <span className="text-xs text-gray-500">Online Calculators for Everything</span>
                    </div>
                </Link>
            </div>
        </div>
    )
}
