   spinner1 = (Spinner) findViewById(R.id.spinner);
        String []opciones={"sumar","restar","multiplicar","dividir"};
        ArrayAdapter <String>adapter = new ArrayAdapter<String>(this,android.R.layout.simple_spinner_item, opciones);
        spinner1.setAdapter(adapter);