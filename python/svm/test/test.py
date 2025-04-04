# pylint: disable=unused-argument

'''Test cases for the SVM folder.'''

import unittest
from unittest.mock import patch, MagicMock

from postgrest.base_request_builder import SingleAPIResponse
from sklearn.svm import SVC
from supabase import Client

import fetch_data  # pylint: disable=import-error
import util  # pylint: disable=import-error


class TestFetchData(unittest.TestCase):
  '''Test cases for fetch_data module.'''

  @patch("fetch_data.create_client")
  @patch("fetch_data.os.makedirs")
  @patch("fetch_data.os.environ.get")
  def test_fetch_data_env_vars_missing(self, mock_get, mock_makedirs, mock_create_client):
    """Test fetch_data raises ValueError when environment variables are missing."""
    mock_get.side_effect = lambda key, default: ""  # Simulate missing env vars
    with self.assertRaises(ValueError):
      fetch_data.fetch_data()

  @patch("fetch_data.create_client")
  @patch("fetch_data.os.makedirs")
  @patch("fetch_data.os.environ.get")
  @patch("fetch_data.query_supabase", return_value=[{"id": 1, "value": "test"}])
  @patch("fetch_data.pd.DataFrame.to_csv")
  def test_fetch_data_success(self,
                              mock_to_csv,
                              mock_query_supabase,
                              mock_get,
                              mock_makedirs,
                              mock_create_client):
    """Test fetch_data successfully fetches and saves data."""
    mock_get.side_effect = lambda key, default: "mock_url" if key == "SUPABASE_URL" else "mock_key"
    mock_supabase = MagicMock()
    mock_create_client.return_value = mock_supabase

    mock_response = MagicMock(spec=SingleAPIResponse)
    mock_response.data = {"kf_descriptions": {"1.1": "desc1", "2.1": "desc2"}}
    mock_supabase.schema().table().select().single().execute.return_value = mock_response

    fetch_data.fetch_data()

    mock_create_client.assert_called_once_with("mock_url", "mock_key")
    mock_to_csv.assert_called()

  @patch("fetch_data.create_client")
  def test_query_supabase(self, mock_create_client):
    """Test query_supabase fetches data correctly."""
    mock_supabase = MagicMock()
    mock_create_client.return_value = mock_supabase

    mock_response = MagicMock(spec=SingleAPIResponse)
    mock_response.data = [{"id": 1, "value": "test"}]
    mock_supabase.schema().table().select().execute.return_value = mock_response

    result = fetch_data.query_supabase(mock_supabase, "mock_table")
    self.assertEqual(result, [{"id": 1, "value": "test"}])


class TestUtil(unittest.TestCase):
  def test_percent_bar(self):
    """Test percent_bar returns correctly formatted progress bars."""
    self.assertIn("⣿", util.percent_bar(0.5, 10))
    self.assertIn("⣀", util.percent_bar(0.0, 10))
    self.assertIn("\033[32m", util.percent_bar(0.7, 10))  # Green color for high values

  @patch("builtins.print")
  def test_log(self, mock_print):
    """Test log only prints when verbose is True."""
    util.log(True, "Test Message")
    mock_print.assert_called_once_with("Test Message", end='\n')

    mock_print.reset_mock()
    util.log(False, "Test Message")
    mock_print.assert_not_called()

  @patch("util.pickle.dump")
  @patch("builtins.open", new_callable=unittest.mock.mock_open)
  @patch("util.os.makedirs")
  @patch("util.Client.storage")
  def test_export_upload_model(self, mock_storage, mock_makedirs, mock_open, mock_pickle_dump):
    """Test export_upload_model exports and uploads a model correctly."""
    mock_supabase = MagicMock(spec=Client)
    model = SVC()

    util.export_upload_model(model, "test_kf", supabase=mock_supabase)

    mock_makedirs.assert_called_once_with("models", exist_ok=True)
    mock_open.assert_any_call("models/test_kf.pkl", 'wb')
    mock_open.assert_any_call("models/test_kf.pkl", 'rb')
    mock_pickle_dump.assert_called_once()


if __name__ == "__main__":
  unittest.main()
