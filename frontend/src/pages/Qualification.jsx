import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Qualification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/api/qualifications/questions/${id}`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleFileUpload = async (questionId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/qualifications/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      handleAnswerChange(questionId, response.data.filePath);
    } catch (error) {
      setError('Failed to upload file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const answerArray = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || '',
        filePath: typeof answers[q.id] === 'string' && answers[q.id].includes('uploads') ? answers[q.id] : null
      }));

      await api.post(`/api/qualifications/answers/${id}`, { answers: answerArray });
      alert('Answers submitted successfully! Waiting for admin approval.');
      navigate(`/competitions/${id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading questions...</div>;
  }

  return (
    <div className="container">
      <h1>Qualification Questions</h1>
      <form onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={question.id} className="card">
            <h3>
              Question {index + 1} {question.isRequired && <span style={{ color: 'red' }}>*</span>}
            </h3>
            <p>{question.question}</p>

            {question.type === 'text' && (
              <div className="form-group">
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.isRequired}
                />
              </div>
            )}

            {question.type === 'multiple_choice' && (
              <div className="form-group">
                {question.options && (typeof question.options === 'string' ? JSON.parse(question.options) : question.options).map((option, optIndex) => (
                  <label key={optIndex} style={{ display: 'block', marginBottom: '10px' }}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      required={question.isRequired}
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {question.type === 'file_upload' && (
              <div className="form-group">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload(question.id, e.target.files[0]);
                    }
                  }}
                  required={question.isRequired}
                />
                {answers[question.id] && (
                  <p className="success">File uploaded: {answers[question.id]}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      </form>
    </div>
  );
};

export default Qualification;

