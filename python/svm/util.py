
def percent_bar(percent: float, width: int) -> str:
  '''
  Generates a progress bar string for a given percentage.

  :param percent: The percentage to represent (0.0 to 1.0).
  :type percent: float
  :param width: The width of the progress bar.
  :type width: int
  :return: A string representing the progress bar.
  :rtype: str
  '''
  filled_length = int(percent * width)
  bar = '⣿' * filled_length + '⣀' * (width - filled_length)
  return f"{bar} {percent * 100:.2f}%"


def log(verbose: bool, string: str, end='\n') -> None:
  """
  Logs a message if verbose mode is enabled.

  :param verbose: If True, the message will be printed to the console.
  :type verbose: bool
  :param string: The message to log.
  :type string: str
  :param end: The string appended after the message (default is '').
  :type end: str
  """
  if verbose:
    print(string, end=end)
