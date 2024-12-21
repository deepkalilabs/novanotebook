import re

def clean_ansi_output(output):
    """Remove ANSI escape codes and format the traceback in a readable way."""
    # Pattern to remove ANSI escape codes
    ansi_escape = re.compile(r'\x1b[^m]*m')
    
    if isinstance(output, dict):
        if 'traceback' in output:
            # Clean each line in the traceback
            cleaned_traceback = [ansi_escape.sub('', line) for line in output['traceback']]
            # Join the lines with proper formatting
            formatted_error = {
                'error_type': output.get('ename', 'Unknown Error'),
                'error_message': output.get('evalue', ''),
                'traceback': '\n'.join(cleaned_traceback)
            }
            return formatted_error
    
    # If it's a string, just clean the ANSI codes
    return ansi_escape.sub('', str(output))