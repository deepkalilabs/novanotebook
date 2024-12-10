import sys
import os
import tempfile
tempfile.tempdir = '/tmp'

# Set common environment variables that various libraries use for temp/cache directories
os.environ['TMPDIR'] = '/tmp'
os.environ['TEMP'] = '/tmp'
os.environ['TMP'] = '/tmp'
os.environ['HOME'] = '/tmp'
os.environ['PYTHONUSERBASE'] = '/tmp'
os.environ['XDG_CACHE_HOME'] = '/tmp/.cache'
os.environ['JOBLIB_TEMP_FOLDER'] = '/tmp'
os.environ['DSP_CACHE_DIR'] = '/tmp'

# If any code tries to write to user's home directory, redirect to /tmp
os.environ['USERPROFILE'] = '/tmp'  # Windows-style
os.environ['HOMEPATH'] = '/tmp'     # Windows-style
os.environ['HOMEDRIVE'] = ''        # Windows-style
os.environ['DSP_CACHE_DISABLE'] = '1'

# Add /tmp to the start of Python's module search path
sys.path.insert(0, '/tmp')
