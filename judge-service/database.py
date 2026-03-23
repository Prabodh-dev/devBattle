from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_uri = os.getenv('MONGODB_URI', 'mongodb://admin:admin123@localhost:27017/devbattle?authSource=admin')
client = MongoClient(mongo_uri)
db = client['devbattle']


def get_test_cases(problem_id: str):
    """
    Retrieve test cases for a problem from MongoDB
    
    Args:
        problem_id: Problem ID
        
    Returns:
        List of test cases
    """
    try:
        from bson.objectid import ObjectId
        
        test_cases = list(db.testcases.find({
            'problem': ObjectId(problem_id)
        }))
        
        # Convert ObjectId to string for JSON serialization
        for tc in test_cases:
            tc['_id'] = str(tc['_id'])
            tc['problem'] = str(tc['problem'])
        
        return test_cases
        
    except Exception as e:
        print(f"Error fetching test cases: {e}")
        return []
