import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const flatFaqData = [
    {
        q: 'What is the NIT Jamshedpur Alumni Portal?',
        a: 'The NIT Jamshedpur Alumni Portal is the official platform for alumni of National Institute of Technology, Jamshedpur. It helps graduates stay connected, discover opportunities, attend events, and give back to the institute.'
    },
    {
        q: 'Who can register on the portal?',
        a: 'Any graduate, postgraduate, or doctoral alumnus of NIT Jamshedpur (formerly RIT Jamshedpur) can register. Current students and faculty with admin approval can also access certain features.'
    },
    {
        q: 'Is there a fee to use the portal?',
        a: 'No, the alumni portal is completely free to use. Simply register with your email and start connecting with fellow alumni.'
    },
    {
        q: 'How do I create an account?',
        a: 'Click the "Sign Up" button on the homepage, fill in your details including name, email, graduation year, and department, then set a password. Your account will be created instantly.'
    },
    {
        q: 'How do I update my profile information?',
        a: 'After logging in, go to your Dashboard and click "View Full Profile". From there you can edit your bio, current position, company, location, skills, and contact details.'
    },
    {
        q: 'I forgot my password. What should I do?',
        a: 'Click "Forgot password?" on the login page. Enter your registered email and we\'ll send you a password reset link. The link is valid for 10 minutes.'
    },
    {
        q: 'How does the Alumni Directory work?',
        a: 'The Alumni Directory lets you search for fellow NIT Jamshedpur graduates by name, department, batch, company, or skills. Click on any profile card to view their full profile and connect.'
    },
    {
        q: 'Can I post a job on the Job Board?',
        a: 'Yes! Once logged in, visit the Jobs page and click "Post Job". Fill in the job details including title, company, location, type, and description. Your posting will be visible to all alumni.'
    },
    {
        q: 'How do I RSVP to an event?',
        a: 'Navigate to the Events page, find the event you\'re interested in, and click the "RSVP Now" button. You\'ll be added to the attendees list and can view other attendees.'
    },
    {
        q: 'Can I share my success story?',
        a: 'Absolutely! Go to the News & Stories page and click "Share Story". Write your story with a title, summary, and full content. You can also add tags to categorize it.'
    },
    {
        q: 'Is my personal information safe?',
        a: 'Yes. We use industry-standard encryption for passwords and secure communication. Your personal data is only visible to registered alumni members and is never shared with third parties.'
    },
    {
        q: 'Can I control what information is visible on my profile?',
        a: 'Yes, you can choose what details to share on your profile. Only your name and department are required — all other fields like phone, location, and bio are optional.'
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen pt-20 pb-24 px-4">
            {/* Centered Container */}
            <div className="max-w-4xl mx-auto">
                
                {flatFaqData.map((item, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div
                            key={index}
                            className="border-b border-gray-300 dark:border-gray-600"
                        >
                            {/* Question */}
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex items-start justify-between py-5 text-left"
                            >
                                <div className="flex gap-3">
                                    <span className="font-bold min-w-[28px]">
                                        {index + 1}.
                                    </span>

                                    <h3 className="font-bold leading-snug">
                                        {item.q}
                                    </h3>
                                </div>

                                <span className="mt-1">
                                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </span>
                            </button>

                            {/* Answer */}
                            {isOpen && (
                                <div className="ml-[28px] pl-3 pb-5">
                                    <p className="leading-relaxed">
                                        {item.a}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FAQ;