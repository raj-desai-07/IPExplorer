from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib import messages
import requests


def home(request):
    return render(request, 'index.html')

def howItWorks(request):
    return render(request, 'how-it-works.html')

def ipDetails(request):
    if request.method == 'POST':
        ip_address = request.POST.get('ip-address')
        try:
            url = f"https://ipwho.is/{ip_address}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()

            data = response.json()

            if not data.get('success'):
                error_message = data.get(
                    'message',
                    'Unable to fetch IP information.'
                )

                if error_message == 'Reserved range':
                    messages.error(
                        request,
                        'The entered IP address is reserved. Please enter a public IP address.'
                    )
                else:
                    messages.error(
                        request,
                        f"Unable to fetch IP information: {error_message}"
                    )

                return redirect('/')

            # API request was successful
            return render(
                request,
                'ip-details.html',
                {'data': data}
            )

        except requests.exceptions.Timeout:
            messages.error(
                request,
                "The IP information service took too long to respond. Please try again."
            )

        except requests.exceptions.ConnectionError:
            messages.error(
                request,
                "Unable to connect to the IP information service. Please try again later."
            )

        except requests.exceptions.HTTPError:
            messages.error(
                request,
                "The IP information service rejected the request. Please try again later."
            )

        except requests.exceptions.RequestException:
            messages.error(
                request,
                "An error occurred while fetching IP information. Please try again later."
            )

        except ValueError:
            messages.error(
                request,
                "The IP information service returned an invalid response."
            )

        return redirect('/')

    return redirect('/')