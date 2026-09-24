from django.urls import path
from IPapp.views import *

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('how-it-works/', howItWorks, name='how-it-works'),
    path('details/', ipDetails, name='ip-details'),
]
