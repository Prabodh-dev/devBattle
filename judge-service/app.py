from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from evaluator import CodeEvaluator
from database import get_test_cases
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize code evaluator
evaluator = CodeEvaluator()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200


@app.route('/evaluate', methods=['POST'])
def evaluate_code():
    """
    Evaluate code submission
    
    Expected payload:
    {
        "submissionId": "string",
        "problemId": "string",
        "language": "python|javascript|java|cpp|c",
        "code": "string",
        "timeLimit": 2000,
        "memoryLimit": 256
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['submissionId', 'problemId', 'language', 'code']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        submission_id = data['submissionId']
        problem_id = data['problemId']
        language = data['language']
        code = data['code']
        time_limit = data.get('timeLimit', 2000)  # milliseconds
        memory_limit = data.get('memoryLimit', 256)  # MB
        
        logger.info(f"Evaluating submission {submission_id} for problem {problem_id}")
        
        # Get test cases from database
        test_cases = get_test_cases(problem_id)
        
        if not test_cases:
            return jsonify({'error': 'No test cases found for problem'}), 404
        
        # Evaluate code
        result = evaluator.evaluate(
            code=code,
            language=language,
            test_cases=test_cases,
            time_limit=time_limit,
            memory_limit=memory_limit
        )
        
        logger.info(f"Evaluation complete for submission {submission_id}: {result['status']}")
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Evaluation error: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500


@app.route('/run', methods=['POST'])
def run_code():
    """
    Run code without test cases (for playground)
    
    Expected payload:
    {
        "language": "python|javascript|java|cpp|c",
        "code": "string",
        "input": "string"
    }
    """
    try:
        data = request.json
        
        language = data.get('language')
        code = data.get('code')
        user_input = data.get('input', '')
        
        if not language or not code:
            return jsonify({'error': 'Missing language or code'}), 400
        
        # Run code with custom input
        result = evaluator.run_code(
            code=code,
            language=language,
            stdin=user_input
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Run code error: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development')
