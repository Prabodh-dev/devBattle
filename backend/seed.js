const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./src/models/Problem');
const TestCase = require('./src/models/TestCase');

dotenv.config();

const seedProblems = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    tags: ['array', 'hash-table'],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    timeLimit: 2000,
    memoryLimit: 256,
    starterCode: {
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      javascript: `function twoSum(nums, target) {
    // Your code here
}`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`,
    },
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isSample: true },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isSample: true },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true },
    ],
  },
  {
    title: 'Reverse String',
    slug: 'reverse-string',
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: 'Easy',
    tags: ['string', 'two-pointers'],
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.',
    ],
    timeLimit: 2000,
    memoryLimit: 256,
    starterCode: {
      python: `def reverse_string(s):
    # Your code here
    pass`,
      javascript: `function reverseString(s) {
    // Your code here
}`,
    },
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isSample: true },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isSample: true },
    ],
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'Easy',
    tags: ['string', 'stack'],
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    timeLimit: 2000,
    memoryLimit: 256,
    starterCode: {
      python: `def is_valid(s):
    # Your code here
    pass`,
      javascript: `function isValid(s) {
    // Your code here
}`,
    },
    testCases: [
      { input: '()', expectedOutput: 'true', isSample: true },
      { input: '()[]{}', expectedOutput: 'true', isSample: true },
      { input: '(]', expectedOutput: 'false', isSample: true },
      { input: '([)]', expectedOutput: 'false', isHidden: true },
      { input: '{[]}', expectedOutput: 'true', isHidden: true },
    ],
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Problem.deleteMany({});
    await TestCase.deleteMany({});
    console.log('Cleared existing data');

    // Insert problems and test cases
    for (const problemData of seedProblems) {
      const { testCases, ...problemInfo } = problemData;

      // Create problem
      const problem = await Problem.create(problemInfo);
      console.log(`Created problem: ${problem.title}`);

      // Create test cases
      for (const tc of testCases) {
        await TestCase.create({
          problem: problem._id,
          ...tc,
        });
      }
      console.log(`Created ${testCases.length} test cases for ${problem.title}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
