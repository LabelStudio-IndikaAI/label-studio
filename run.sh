cd label_studio
python manage.py makemigrations
python manage.py migrate
cd ..
cd label_studio/frontend/
yarn install --frozen-lockfile
npx webpack
cd ..
export LABEL_STUDIO_LOCAL_FILES_SERVING_ENABLED=true
export LABEL_STUDIO_LOCAL_FILES_DOCUMENT_ROOT=/home/ubuntu/
python manage.py collectstatic --no-input
python manage.py runserver 