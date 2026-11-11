import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import { Pedido } from '../entidades/pedido';
import { CompartirComidasService } from '../servicios/compartir-comidas.service';
import { CompartirBebidasService } from '../servicios/compartir-bebidas.service';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pedido.component.html',
  styleUrl: './pedido.component.css'
})
export class PedidoComponent {

  pedido: Pedido = new Pedido();
  mensaje: string = "";
  factura: any = null;

  // qué parte de la página se muestra: el formulario o el formato de pedido
  verFormulario: boolean = true;
  verFactura: boolean = false;

  constructor(private compartirComidasService: CompartirComidasService, private compartirBebidasService: CompartirBebidasService) { }

  // junta las comidas y las bebidas (cada una viene de su servicio) en una sola lista para mostrarla
  lista() {
    return [...this.compartirComidasService.comidasSignal(), ...this.compartirBebidasService.bebidasSignal()];
  }

  // true cuando todavía no hay comidas ni bebidas en el pedido
  pedidoVacio() {
    return this.lista().length == 0;
  }

  // vuelve a guardar la lista del servicio al que pertenece el producto (comida o bebida)
  guardar(p: any) {
    if (p.tipo == 'comida') {
      this.compartirComidasService.enviar([...this.compartirComidasService.comidasSignal()]);
    } else {
      this.compartirBebidasService.enviar([...this.compartirBebidasService.bebidasSignal()]);
    }
  }

  sumar(p: any) {
    p.cantidad = p.cantidad + 1;
    this.guardar(p);
  }

  restar(p: any) {
    if (p.cantidad > 1) {
      p.cantidad = p.cantidad - 1;
      this.guardar(p);
    }
  }

  quitar(p: any) {
    if (p.tipo == 'comida') {
      this.compartirComidasService.enviar(this.compartirComidasService.comidasSignal().filter((x: any) => x !== p));
    } else {
      this.compartirBebidasService.enviar(this.compartirBebidasService.bebidasSignal().filter((x: any) => x !== p));
    }
  }

  // subtotal de un producto (cantidad × precio) ya con formato de pesos
  subtotal(p: any) {
    return this.formato(p.cantidad * p.precio);
  }

  calcularTotal() {
    let total = 0;
    this.lista().forEach((p: any) => {
      total = total + p.precio * p.cantidad;
    });
    return total;
  }

  realizarPedido() {
    if (this.lista().length == 0) {
      this.mensaje = "Agrega al menos un plato o bebida.";
    }
    else if (this.pedido.nombre.trim().split(" ").length < 2) {
      this.mensaje = "Escribe tu nombre completo.";
    }
    else if (this.pedido.telefono.trim().length != 10) {
      this.mensaje = "El celular debe tener 10 dígitos.";
    }
    else if (this.pedido.direccion.trim().length < 5) {
      this.mensaje = "Escribe una dirección válida.";
    }
    else {
      this.mensaje = "";
      // formato de pedido: fecha actual, datos del cliente, lista y total
      this.factura = {
        numero: "MN-" + Date.now().toString().slice(-6),
        fecha: new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' }),
        cliente: this.pedido,
        lista: this.lista(),
        total: this.calcularTotal()
      };
      this.verFactura = true;
      this.verFormulario = false;
    }
  }

  nuevoPedido() {
    this.compartirComidasService.limpiar();
    this.compartirBebidasService.limpiar();
    this.pedido = new Pedido();
    this.factura = null;
    this.verFactura = false;
    this.verFormulario = true;
  }

  formato(valor: number) {
    return "$" + valor.toLocaleString('es-CO');
  }

  // descarga el formato del pedido en PDF (el logo es la misma imagen del sitio)
  descargarPDF() {
    const logo = new Image();
    logo.onload = () => this.crearPDF(logo);
    logo.onerror = () => this.crearPDF(null);
    logo.src = 'assets/img/logo.png';
  }

  crearPDF(logo: HTMLImageElement | null) {
    const f = this.factura;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // logo y encabezado
    doc.setFillColor(6, 9, 15);
    doc.rect(0, 0, 210, 42, 'F');
    if (logo) {
      doc.addImage(logo, 'PNG', 16, 11, 20, 20);
    }
    doc.setTextColor(236, 217, 168);
    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.text('MANILA', 42, 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(201, 169, 110);
    doc.text('RESTAURANTE · MANILA, FILIPINAS · ANSERMA, CALDAS', 42, 31);

    // fecha y datos del cliente
    doc.setTextColor(30, 34, 45);
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.text('Formato de pedido', 14, 56);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('N.º: ' + f.numero, 196, 52, { align: 'right' });
    doc.text('Fecha: ' + f.fecha, 196, 58, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE', 14, 70);
    doc.setFont('helvetica', 'normal');
    doc.text('Nombre completo: ' + f.cliente.nombre, 14, 77);
    doc.text('Celular: ' + f.cliente.telefono, 14, 83);
    doc.text('Dirección: ' + f.cliente.direccion, 14, 89);

    // lista del pedido
    let y = 102;
    doc.setFillColor(14, 21, 34);
    doc.rect(14, y - 6, 182, 9, 'F');
    doc.setTextColor(236, 217, 168);
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', 17, y);
    doc.text('Cant.', 120, y);
    doc.text('V. unitario', 140, y);
    doc.text('Subtotal', 193, y, { align: 'right' });
    doc.setTextColor(30, 34, 45);
    doc.setFont('helvetica', 'normal');
    f.lista.forEach((p: any) => {
      y = y + 9;
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.text(p.nombre.slice(0, 48) + (p.tipo == 'bebida' ? '  (bebida)' : ''), 17, y);
      doc.text(String(p.cantidad), 124, y);
      doc.text(this.formato(p.precio), 140, y);
      doc.text(this.formato(p.precio * p.cantidad), 193, y, { align: 'right' });
      doc.setDrawColor(220, 214, 196);
      doc.line(14, y + 3, 196, y + 3);
    });

    // total
    y = y + 16;
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text('TOTAL A PAGAR', 120, y);
    doc.text(this.formato(f.total), 196, y, { align: 'right' });
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120, 110, 90);
    doc.text('Gracias por elegir MANILA · Donde cada plato es una experiencia', 105, 285, { align: 'center' });

    doc.save('Pedido_' + f.numero + '.pdf');
  }
}
