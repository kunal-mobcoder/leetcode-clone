import { ProblemWorkspace } from './pages/ProblemWorkspace';

const mockProblem = {
  id: "60c72b2f9b1d8b22a8fc2e12",
  title: "1. Two Sum",
  difficulty: "Easy" as const,
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
};

export default function App() {
  return <ProblemWorkspace problem={mockProblem} />;
}
