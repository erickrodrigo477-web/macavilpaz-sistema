import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('mantenimientos')
export class Maintenance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'activo_id' })
  activoId: number;

  @Column({ name: 'fecha_mantenimiento', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaMantenimiento: Date;

  @Column({ name: 'tipo_mantenimiento', length: 50, nullable: true })
  tipoMantenimiento: string; // Preventivo, Correctivo, Predictivo

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  costo: number;

  @Column({ length: 150, nullable: true })
  tecnico: string;

  @Column({ name: 'proximo_mantenimiento', type: 'date', nullable: true })
  proximoMantenimiento: Date;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'activo_id' })
  asset: Asset;
}
