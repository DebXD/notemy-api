import re

def is_password_complex(password):
  # Use a regular expression to check that the password meets certain requirements
  if re.search(r'[A-Z]', password) is None:
    return False
  if re.search(r'[a-z]', password) is None:
    return False
  if re.search(r'[0-9]', password) is None:
    return False
  if len(password) < 8:
    return False
  return True
