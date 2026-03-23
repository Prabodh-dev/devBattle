import docker
import tempfile
import os
import time
import json
from typing import List, Dict, Any


class CodeEvaluator:
    """Code evaluator using Docker containers for sandboxed execution"""
    
    def __init__(self):
        self.docker_client = None
        
        # Language configurations
        self.language_configs = {
            'python': {
                'image': 'python:3.11-alpine',
                'file_ext': '.py',
                'compile_cmd': None,
                'run_cmd': 'python {filename}'
            },
            'javascript': {
                'image': 'node:18-alpine',
                'file_ext': '.js',
                'compile_cmd': None,
                'run_cmd': 'node {filename}'
            },
            'java': {
                'image': 'openjdk:17-alpine',
                'file_ext': '.java',
                'compile_cmd': 'javac {filename}',
                'run_cmd': 'java {classname}'
            },
            'cpp': {
                'image': 'gcc:12-alpine',
                'file_ext': '.cpp',
                'compile_cmd': 'g++ -o program {filename}',
                'run_cmd': './program'
            },
            'c': {
                'image': 'gcc:12-alpine',
                'file_ext': '.c',
                'compile_cmd': 'gcc -o program {filename}',
                'run_cmd': './program'
            }
        }
    
    def _get_docker_client(self):
        """Get or initialize Docker client"""
        if self.docker_client is None:
            try:
                self.docker_client = docker.from_env()
            except Exception as e:
                raise Exception(f"Failed to connect to Docker: {str(e)}")
        return self.docker_client
    
    def evaluate(self, code: str, language: str, test_cases: List[Dict], 
                 time_limit: int = 2000, memory_limit: int = 256) -> Dict[str, Any]:
        """
        Evaluate code against test cases
        
        Args:
            code: Source code to evaluate
            language: Programming language
            test_cases: List of test cases with input and expected output
            time_limit: Time limit in milliseconds
            memory_limit: Memory limit in MB
            
        Returns:
            Dictionary containing evaluation results
        """
        if language not in self.language_configs:
            return {
                'status': 'compilation_error',
                'error': f'Unsupported language: {language}',
                'testCasesPassed': 0,
                'totalTestCases': len(test_cases)
            }
        
        config = self.language_configs[language]
        
        # Compile if needed
        if config['compile_cmd']:
            compile_result = self._compile_code(code, language, config)
            if not compile_result['success']:
                return {
                    'status': 'compilation_error',
                    'error': compile_result['error'],
                    'testCasesPassed': 0,
                    'totalTestCases': len(test_cases)
                }
        
        # Run test cases
        test_results = []
        passed_count = 0
        total_runtime = 0
        max_memory = 0
        
        for idx, test_case in enumerate(test_cases):
            result = self._run_test_case(
                code=code,
                language=language,
                config=config,
                test_input=test_case['input'],
                expected_output=test_case['expectedOutput'],
                time_limit=time_limit,
                memory_limit=memory_limit
            )
            
            test_results.append({
                'testCaseId': test_case.get('_id'),
                'passed': result['passed'],
                'input': test_case['input'] if not test_case.get('isHidden') else '[Hidden]',
                'expectedOutput': test_case['expectedOutput'] if not test_case.get('isHidden') else '[Hidden]',
                'actualOutput': result.get('output', ''),
                'runtime': result.get('runtime', 0),
                'memory': result.get('memory', 0),
                'error': result.get('error')
            })
            
            if result['passed']:
                passed_count += 1
            else:
                # If a test case fails, determine the failure reason
                if result.get('status') == 'time_limit_exceeded':
                    return {
                        'status': 'time_limit_exceeded',
                        'testCasesPassed': passed_count,
                        'totalTestCases': len(test_cases),
                        'testResults': test_results,
                        'runtime': result.get('runtime', 0),
                        'memory': max_memory
                    }
                elif result.get('status') == 'memory_limit_exceeded':
                    return {
                        'status': 'memory_limit_exceeded',
                        'testCasesPassed': passed_count,
                        'totalTestCases': len(test_cases),
                        'testResults': test_results,
                        'runtime': total_runtime,
                        'memory': result.get('memory', 0)
                    }
                elif result.get('error'):
                    return {
                        'status': 'runtime_error',
                        'error': result['error'],
                        'testCasesPassed': passed_count,
                        'totalTestCases': len(test_cases),
                        'testResults': test_results
                    }
            
            total_runtime += result.get('runtime', 0)
            max_memory = max(max_memory, result.get('memory', 0))
        
        # Determine final status
        status = 'accepted' if passed_count == len(test_cases) else 'wrong_answer'
        
        return {
            'status': status,
            'testCasesPassed': passed_count,
            'totalTestCases': len(test_cases),
            'testResults': test_results,
            'runtime': total_runtime,
            'memory': max_memory
        }
    
    def _compile_code(self, code: str, language: str, config: Dict) -> Dict:
        """Compile code if needed"""
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                # Write code to file
                filename = f"Solution{config['file_ext']}"
                filepath = os.path.join(tmpdir, filename)
                
                with open(filepath, 'w') as f:
                    f.write(code)
                
                # Run compilation
                compile_cmd = config['compile_cmd'].format(filename=filename)
                
                docker_client = self._get_docker_client()
                container = docker_client.containers.run(
                    config['image'],
                    command=f"sh -c '{compile_cmd}'",
                    volumes={tmpdir: {'bind': '/app', 'mode': 'rw'}},
                    working_dir='/app',
                    detach=False,
                    remove=True,
                    mem_limit='256m',
                    network_disabled=True
                )
                
                return {'success': True}
                
        except docker.errors.ContainerError as e:
            return {
                'success': False,
                'error': e.stderr.decode('utf-8') if e.stderr else 'Compilation failed'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _run_test_case(self, code: str, language: str, config: Dict,
                       test_input: str, expected_output: str,
                       time_limit: int, memory_limit: int) -> Dict:
        """Run code against a single test case"""
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                # Write code to file
                filename = f"Solution{config['file_ext']}"
                filepath = os.path.join(tmpdir, filename)
                
                with open(filepath, 'w') as f:
                    f.write(code)
                
                # Prepare run command
                if language == 'java':
                    # Extract class name from code
                    classname = 'Solution'
                    run_cmd = config['run_cmd'].format(classname=classname)
                else:
                    run_cmd = config['run_cmd'].format(filename=filename)
                
                # Run code
                start_time = time.time()
                
                docker_client = self._get_docker_client()
                container = docker_client.containers.run(
                    config['image'],
                    command=f"sh -c '{run_cmd}'",
                    volumes={tmpdir: {'bind': '/app', 'mode': 'ro'}},
                    working_dir='/app',
                    stdin_open=True,
                    detach=True,
                    mem_limit=f'{memory_limit}m',
                    network_disabled=True
                )
                
                # Send input to container
                container_socket = container.attach_socket(params={'stdin': 1, 'stream': 1})
                container_socket._sock.send(test_input.encode())
                container_socket.close()
                
                # Wait for completion with timeout
                try:
                    result = container.wait(timeout=time_limit / 1000.0)
                    runtime = int((time.time() - start_time) * 1000)  # milliseconds
                    
                    # Get output
                    output = container.logs().decode('utf-8').strip()
                    
                    # Get memory usage
                    stats = container.stats(stream=False)
                    memory_usage = stats['memory_stats'].get('usage', 0) / (1024 * 1024)  # MB
                    
                    # Remove container
                    container.remove()
                    
                    # Check if output matches expected
                    passed = output.strip() == expected_output.strip()
                    
                    return {
                        'passed': passed,
                        'output': output,
                        'runtime': runtime,
                        'memory': round(memory_usage, 2),
                        'status': 'accepted' if passed else 'wrong_answer'
                    }
                    
                except Exception as timeout_error:
                    container.kill()
                    container.remove()
                    return {
                        'passed': False,
                        'status': 'time_limit_exceeded',
                        'runtime': time_limit,
                        'error': 'Time limit exceeded'
                    }
                    
        except docker.errors.ContainerError as e:
            return {
                'passed': False,
                'status': 'runtime_error',
                'error': e.stderr.decode('utf-8') if e.stderr else 'Runtime error'
            }
        except Exception as e:
            return {
                'passed': False,
                'status': 'runtime_error',
                'error': str(e)
            }
    
    def run_code(self, code: str, language: str, stdin: str = '') -> Dict:
        """Run code with custom input (for playground)"""
        if language not in self.language_configs:
            return {'error': f'Unsupported language: {language}'}
        
        config = self.language_configs[language]
        
        result = self._run_test_case(
            code=code,
            language=language,
            config=config,
            test_input=stdin,
            expected_output='',  # Not checking output
            time_limit=5000,
            memory_limit=256
        )
        
        return {
            'output': result.get('output', ''),
            'runtime': result.get('runtime', 0),
            'memory': result.get('memory', 0),
            'error': result.get('error')
        }
