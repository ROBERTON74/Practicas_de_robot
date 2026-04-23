import json
import sys
import time


class Robot:
    def __init__(self):
        self._delay = 1.2

    def _enviar(self, comando):
        print(json.dumps(comando), flush=True)
        time.sleep(self._delay)

    def mover_j1(self, grados):
        self._enviar({"eje": "j1", "valor": float(grados)})

    def mover_j2(self, grados):
        self._enviar({"eje": "j2", "valor": float(grados)})

    def mover_z(self, mm):
        self._enviar({"eje": "z", "valor": float(mm)})

    def mover_r(self, grados):
        self._enviar({"eje": "r", "valor": float(grados)})

    def esperar(self, segundos):
        time.sleep(float(segundos))

    def velocidad(self, v):
        """Cambia el tiempo de espera entre pasos (segundos, minimo 0.1)."""
        self._delay = max(0.1, float(v))

    def log(self, mensaje):
        print(json.dumps({"log": str(mensaje)}), flush=True)
